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
set -euo pipefail

SWAPFILE=/swapfile
SIZE_MB=2048

if [[ $EUID -ne 0 ]]; then
	echo "sudo 로 실행하세요: sudo bash $0" >&2
	exit 1
fi

# 이미 붙어 있으면 아무것도 하지 않습니다. 배포 때 실수로 다시 돌려도 안전하도록.
if swapon --show | grep -q .; then
	echo "스왑이 이미 있습니다:"
	swapon --show
	exit 0
fi

if [[ ! -f $SWAPFILE ]]; then
	# fallocate 는 희소 파일을 만들 수 있고 그러면 mkswap 이 거부합니다. dd 로 실제
	# 블록을 채웁니다 — 2 GiB 라 8 GiB EBS 에서 감당됩니다(먼저 여유를 봅니다).
	avail_mb=$(df --output=avail -m / | tail -1 | tr -d ' ')
	if (( avail_mb < SIZE_MB + 1024 )); then
		echo "디스크 여유가 부족합니다(${avail_mb}MB). 먼저 정리하세요:" >&2
		echo "  docker image prune -f && docker builder prune -f" >&2
		exit 1
	fi
	dd if=/dev/zero of=$SWAPFILE bs=1M count=$SIZE_MB status=progress
fi

# 0600 이 아니면 swapon 이 경고하고, 스왑 내용은 프로세스 메모리라 실제로 민감합니다.
chmod 600 $SWAPFILE
mkswap $SWAPFILE
swapon $SWAPFILE

# 재부팅 후에도 붙게 합니다. **이걸 빼면 다음 재부팅에 조용히 원상복귀합니다** —
# 그때는 "예전에 고쳤는데 또 터진다" 로 보여서 원인 찾기가 처음보다 어렵습니다.
if ! grep -q "^$SWAPFILE" /etc/fstab; then
	echo "$SWAPFILE none swap sw 0 0" >>/etc/fstab
fi

# 기본값 60 은 상시로 스왑을 쓰겠다는 뜻입니다. 여기서 스왑은 피크용 안전망이라
# 10 으로 내립니다(위 "스왑으로 충분한가" 참고).
sysctl -w vm.swappiness=10
if ! grep -q "^vm.swappiness" /etc/sysctl.conf; then
	echo "vm.swappiness=10" >>/etc/sysctl.conf
fi

echo
echo "완료:"
swapon --show
free -m
