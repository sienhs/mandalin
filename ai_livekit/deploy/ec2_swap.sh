#!/usr/bin/env bash
# AI 전용 EC2(t3.micro, 2 vCPU / 1 GiB)에 스왑을 붙입니다. **사람이 한 번만 실행합니다.**
#
# 옆의 `docker-compose.yml` 은 지난 구성의 사본이지만 이 스크립트는 현행입니다.
#
#   sudo bash deploy/ec2_swap.sh
#
# ## 왜 필요한가
#
# 1 GiB 에서 OS·Docker 가 약 250MB, 컨테이너 둘이 유휴로 약 430MB 를 씁니다. 남는
# 300MB 남짓이 두 가지에 동시에 쓰입니다 —
#
#   1. 세션(방 하나 = 약 45MB). 여기까지는 `BOT_MAX_CONCURRENT_ROOMS` 가 셉니다.
#   2. **배포.** CI 의 `deploy_ai` 가 이 호스트에서 `docker compose up -d --build` 를
#      돌립니다. 컨테이너 둘이 그대로 떠 있는 채로 gitlab-runner + rsync +
#      `pip install -r requirements.txt` 가 그 위에 얹힙니다. `livekit-agents` 의
#      의존성 트리를 해석하는 피크가 300MB 를 넘기면 커널이 무언가를 죽입니다.
#
# 2번은 `BOT_MAX_CONCURRENT_ROOMS` 로 막을 수 없습니다 — 세션이 0개여도 터집니다.
# 증상이 `Killed` 한 줄이나 잡 실패뿐이어서 배포 스크립트를 아무리 봐도 안 보입니다.
#
# ## 스왑으로 충분한가
#
# 배포 피크에는 충분합니다. 몇 분간 느려지는 대신 안 죽습니다.
#
# **세션이 상시로 스왑에 들어가면 그건 다른 문제입니다** — WebRTC 오디오는 지연에
# 민감해서 스왑에서 도는 job 은 전사가 밀립니다. 그때 할 일은 스왑을 늘리는 게 아니라
# `BOT_MAX_CONCURRENT_ROOMS` 를 내리거나 인스턴스를 올리는 것입니다. 아래
# `vm.swappiness=10` 이 그 방향입니다 — 스왑을 상시 캐시가 아니라 피크용 안전망으로
# 씁니다.
#
# ## 서버 상태를 모른다고 가정합니다
#
# 몇 번을 돌려도 같은 결과가 나와야 합니다. 그래서 단계마다 "이미 되어 있는가" 가 아니라
# **"제 값으로 되어 있는가"** 를 봅니다 — 있는지만 보면 크기가 모자란 스왑이나 값이 다른
# swappiness 를 정상으로 읽고 지나갑니다.
set -euo pipefail

SWAPFILE=/swapfile
SIZE_MB=2048
SWAPPINESS=10
SIZE_BYTES=$((SIZE_MB * 1024 * 1024))

if [[ $EUID -ne 0 ]]; then
	echo "sudo 로 실행하세요: sudo bash $0" >&2
	exit 1
fi

#: 우리 스왑이 붙어 있으면 그 크기(바이트), 아니면 빈 문자열.
#:
#: **`swapon --show` 에 내용이 있는지만 보면 안 됩니다.** 다른 스왑(작은 파일이나 스왑
#: 파티션)이 있을 때 그걸 우리 것으로 읽고, 2GiB 도 안 붙고 아래 fstab·swappiness 도
#: 손대지 않은 채 "이미 있습니다" 로 끝납니다.
active_bytes() {
	swapon --show=NAME,SIZE --bytes --noheadings 2>/dev/null |
		awk -v f="$SWAPFILE" '$1 == f { print $2; exit }'
}

current=$(active_bytes)

if [[ -n $current ]] && ((current < SIZE_BYTES)); then
	# **자동으로 `swapoff` 하지 않습니다.** 메모리가 눌린 1 GiB 호스트에서 스왑을 떼면
	# 커널이 그 내용을 RAM 으로 올리다 OOM 이 납니다 — 이 스크립트가 막으려던 바로 그
	# 사고입니다. 사람이 한가한 시간에 하도록 남깁니다.
	echo "경고: $SWAPFILE 이 ${current} 바이트로 목표(${SIZE_BYTES})보다 작습니다." >&2
	echo "  한가할 때 직접 다시 만드세요:" >&2
	echo "    sudo swapoff $SWAPFILE && sudo rm $SWAPFILE && sudo bash $0" >&2
	echo "  (아래 fstab·swappiness 설정은 계속 진행합니다)" >&2
elif [[ -z $current ]]; then
	other=$(swapon --show=NAME --noheadings 2>/dev/null || true)
	if [[ -n $other ]]; then
		# 있어도 그냥 둡니다 — 스왑은 여러 개를 동시에 쓸 수 있고, 남의 것을 떼는 건
		# 이 스크립트가 할 일이 아닙니다. 다만 로그에는 남깁니다.
		echo "참고: 다른 스왑이 이미 있습니다(그대로 둡니다): $(echo "$other" | tr '\n' ' ')"
	fi

	# **크기가 다르면 지우고 다시 만듭니다.** "파일이 있으면 건너뜀" 으로 두면, `dd` 가
	# 중간에 끊겨 남은 짧은 파일을 그대로 `mkswap` 해서 목표의 몇 분의 일짜리 스왑이
	# 조용히 만들어집니다 — 에러 없이 "완료" 가 뜹니다.
	if [[ ! -f $SWAPFILE ]] || (($(stat -c %s "$SWAPFILE") != SIZE_BYTES)); then
		rm -f "$SWAPFILE"
		avail_mb=$(df --output=avail -m / | tail -1 | tr -d ' ')
		if ((avail_mb < SIZE_MB + 1024)); then
			echo "디스크 여유가 부족합니다(${avail_mb}MB). 먼저 정리하세요:" >&2
			echo "  docker image prune -f && docker builder prune -f" >&2
			exit 1
		fi
		# fallocate 는 희소 파일을 만들 수 있고 그러면 mkswap 이 거부합니다. dd 로 실제
		# 블록을 채웁니다 — 2 GiB 라 8 GiB EBS 에서 감당됩니다.
		dd if=/dev/zero of="$SWAPFILE" bs=1M count=$SIZE_MB status=progress
	fi

	# 0600 이 아니면 swapon 이 경고하고, 스왑 내용은 프로세스 메모리라 실제로 민감합니다.
	chmod 600 "$SWAPFILE"
	mkswap "$SWAPFILE"
	swapon "$SWAPFILE"
else
	echo "스왑이 이미 제 크기로 붙어 있습니다($SWAPFILE)."
fi

# 재부팅 후에도 붙게 합니다. **이걸 빼면 다음 재부팅에 조용히 원상복귀합니다** —
# 그때는 "예전에 고쳤는데 또 터진다" 로 보여서 원인 찾기가 처음보다 어렵습니다.
if ! grep -q "^${SWAPFILE}[[:space:]]" /etc/fstab; then
	echo "$SWAPFILE none swap sw 0 0" >>/etc/fstab
fi

# 기본값 60 은 상시로 스왑을 쓰겠다는 뜻입니다. 여기서 스왑은 피크용 안전망이라
# 10 으로 내립니다(위 "스왑으로 충분한가" 참고).
sysctl -q -w vm.swappiness=$SWAPPINESS

# **값까지 맞춥니다.** 줄이 있는지만 보면, 이미 `vm.swappiness=60` 이 적혀 있을 때
# 런타임만 10 이 되고 파일은 60 이라 **다음 재부팅에 되돌아갑니다** — 바로 위 fstab
# 주석과 같은 함정인데, 이쪽은 `sysctl -w` 때문에 지금 확인해도 10 으로 보여 더 안 보입니다.
if grep -qE '^[[:space:]]*vm\.swappiness[[:space:]]*=' /etc/sysctl.conf; then
	sed -i -E "s/^[[:space:]]*vm\.swappiness[[:space:]]*=.*/vm.swappiness=$SWAPPINESS/" /etc/sysctl.conf
else
	echo "vm.swappiness=$SWAPPINESS" >>/etc/sysctl.conf
fi

# `/etc/sysctl.d/*.conf` 가 `/etc/sysctl.conf` 를 이길 수 있습니다. 우리가 고칠 수 있는
# 범위 밖이라 알리기만 합니다 — 모르고 지나가면 위와 똑같이 재부팅에 되돌아갑니다.
if conflicts=$(grep -rlE '^[[:space:]]*vm\.swappiness[[:space:]]*=' /etc/sysctl.d/ 2>/dev/null) &&
	[[ -n $conflicts ]]; then
	echo "경고: /etc/sysctl.d 에도 vm.swappiness 를 정하는 파일이 있습니다 — 그쪽이 이길 수 있습니다:" >&2
	while IFS= read -r conflict; do
		echo "  $conflict" >&2
	done <<<"$conflicts"
fi

echo
echo "완료:"
swapon --show
free -m

# 마지막으로 목표대로 됐는지 확인합니다. 여기까지 와서 아니면 위 경고 중 하나를
# 지나온 것이므로, 조용히 성공으로 끝내지 않습니다.
final=$(active_bytes)
if [[ -z $final ]] || ((final < SIZE_BYTES)); then
	echo "확인 실패: $SWAPFILE 이 목표 크기로 붙어 있지 않습니다 — 위 경고를 보세요." >&2
	exit 1
fi
