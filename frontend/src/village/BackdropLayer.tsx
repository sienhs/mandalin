import { useState } from 'react'
import { NO_BACKDROP, backdropImage, findBackdrop, type BackdropKey } from './backdrops'

/**
 * 캔버스 뒤에 까는 배경 사진 한 장.
 *
 * <p><b>이 컴포넌트는 반드시 `<Scene>` 보다 <i>앞에</i> 놓는다.</b> 둘 다 캔버스 `section`
 * 안의 형제인데, R3F 가 만드는 캔버스 래퍼가 `position: relative` 라 <b>DOM 순서가 곧
 * 겹침 순서</b>가 된다. 뒤에 놓으면 사진이 마을을 덮는다.
 *
 * <p>사진이 실제로 보이려면 캔버스가 투명해야 한다 — `Scene` 이 `gl.alpha` 와
 * `<color attach="background">` 로 그 조건을 맞춘다. 그쪽 주석 참고.
 *
 * <p><b>`cover` 로 채운다.</b> 그림마다 가운데가 비어 있고 그 자리에 마을이 앉으므로,
 * 잘려 나가는 쪽은 항상 바깥 장식이다. `contain` 으로 두면 위아래에 빈 띠가 생기면서
 * 정작 마을이 앉을 빈 자리는 작아진다.
 */
export function BackdropLayer({ backdrop }: { backdrop: BackdropKey }) {
  const meta = findBackdrop(backdrop)

  if (backdrop === NO_BACKDROP || !meta) return null

  /*
    key 로 갈아 끼운다. 배경을 바꾸면 컴포넌트가 새로 마운트되면서 `loaded` 가 false 로
    돌아가고, 새 사진이 도착할 때까지 그 사진의 tint 가 깔린다. key 가 없으면 `<img>` 의
    src 만 바뀌어 <b>이전 사진이 그대로 남은 채</b> 새 사진을 기다린다.
  */
  return <Photo key={meta.key} src={backdropImage(meta.key)} tint={meta.tint} />
}

function Photo({ src, tint }: { src: string; tint: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div aria-hidden="true" className="absolute inset-0 z-0" style={{ background: tint }}>
      <img
        src={src}
        alt=""
        /*
          디코딩까지 마친 뒤 onLoad 가 오도록 async 로 둔다. 2048px 짜리를 메인 스레드에서
          동기 디코딩하면 그 프레임에 마을이 한 번 끊긴다.
        */
        decoding="async"
        onLoad={() => setLoaded(true)}
        className="size-full object-cover transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  )
}
