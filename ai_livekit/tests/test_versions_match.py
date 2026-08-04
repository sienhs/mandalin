"""배포가 띄우는 LiveKit 서버 버전과 **README 가 검증했다고 적은 버전**이 같은지.

두 곳에 따로 적혀 있고, 갈렸을 때 아무 데서도 드러나지 않습니다 —

    README.md                   "기준 버전은 … LiveKit 서버 1.13.5"
    deploy/docker-compose.yml   image: livekit/livekit-server:v1.8   ← 실제로 뜨는 것

실제로 이 상태였습니다. **검증했다는 것보다 다섯 마이너 낮은 서버가 배포에 뜨는데
테스트도 로컬도 초록불**이었습니다(로컬은 README 절차대로 `--dev` 로 태그 없이 띄우므로
compose 의 핀을 한 번도 타지 않습니다). 발견된 계기는 배포 직전에 두 파일을 나란히 읽은
것뿐이었습니다.

버전을 올릴 때는 두 곳을 같이 고치세요. 이 테스트가 한쪽만 고친 것을 잡습니다.
"""
from __future__ import annotations

import re
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
COMPOSE = REPO_ROOT / "deploy" / "docker-compose.yml"
README = REPO_ROOT / "README.md"

#: README 첫머리의 "기준 버전은 … LiveKit 서버 1.13.5 …" 에서 숫자만 뽑습니다.
README_SERVER = re.compile(r"LiveKit 서버 ([0-9]+(?:\.[0-9]+)*)")


def compose_image() -> str:
    config = yaml.safe_load(COMPOSE.read_text(encoding="utf-8"))
    return config["services"]["livekit"]["image"]


def test_the_deployed_server_version_is_the_one_the_readme_verified():
    image = compose_image()
    tag = image.rsplit(":", maxsplit=1)[-1]

    stated = README_SERVER.search(README.read_text(encoding="utf-8"))
    assert stated, "README 에서 'LiveKit 서버 <버전>' 을 찾지 못했습니다"

    assert tag == f"v{stated.group(1)}", (
        f"compose 는 {tag} 를 띄우는데 README 는 {stated.group(1)} 을 검증했다고 적어 뒀습니다 — "
        "올릴 때 두 곳을 같이 고치세요"
    )


def test_the_server_image_is_pinned_to_a_patch_version():
    """마이너 태그(`v1.13`)는 패치가 조용히 바뀝니다.

    "어제와 같은 것을 띄웠다" 가 보장되지 않으면, 재현되지 않는 장애를 만났을 때 서버
    버전을 용의자에서 지울 수 없습니다.
    """
    tag = compose_image().rsplit(":", maxsplit=1)[-1]
    assert re.fullmatch(r"v[0-9]+\.[0-9]+\.[0-9]+", tag), (
        f"이미지 태그가 {tag} 입니다 — `vX.Y.Z` 로 고정하세요(`latest`·`vX.Y` 금지)"
    )
