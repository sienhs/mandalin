import { useStore } from '../../data/store'
import { useToast } from './Toast'
import { cn } from '../../utils/cn'

/**
 * 내 UUID + 복사 버튼.
 *
 * <p>친구를 추가하려면 상대에게 내 UUID 를 알려 줘야 하는데, 그 값이 마이페이지에만 있어서
 * 친구 화면에서 한 번 나갔다 돌아와야 했다. 정작 필요한 자리에 없는 정보였다.
 *
 * <p>여러 화면이 크기만 다르고 하는 일은 같으므로 한 컴포넌트로 둔다. 따로 만들면
 * 복사 문구나 잘림 규칙이 갈라진다.
 *
 * <p>`value` 를 주면 남의 UUID 도 같은 모양으로 보여 준다 — 친구 목록에서 상대 UUID 를
 * 앞 8자만 잘라 배지로 띄우던 자리가 그렇다. 잘린 값은 복사할 수도, 대조할 수도 없어
 * 보여 주는 의미가 없었다.
 */
export function UuidChip({
  value,
  label,
  size = 'sm',
  className,
}: {
  /** 보여 줄 UUID. 생략하면 내 것. */
  value?: string | null
  label?: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const { user } = useStore()
  const toast = useToast()
  const uuid = value ?? user?.uuid ?? null
  const caption = label ?? (value ? 'UUID' : '내 UUID')

  const copy = () => {
    if (!uuid) return
    void navigator.clipboard?.writeText(uuid)
    toast.show({ tone: 'success', title: 'UUID 를 복사했어요' })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border',
        size === 'sm' ? 'h-8 pl-3 pr-1' : 'h-10 pl-4 pr-1.5',
        className,
      )}
      style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
    >
      <span
        className={cn('muted shrink-0 font-bold', size === 'sm' ? 'text-[11px]' : 'text-[12px]')}
      >
        {caption}
      </span>

      {/*
        UUID 는 36자라 어디서든 줄을 넘긴다. 통째로 보여 줄 이유가 없다 — 눈으로 옮겨 적는
        값이 아니라 복사해 붙여넣는 값이므로, 앞부분만 보여 주고 전체는 title 로 남긴다.
      */}
      <code
        title={uuid ?? undefined}
        className={cn(
          'min-w-0 flex-1 truncate font-mono font-bold',
          size === 'sm' ? 'text-[11px]' : 'text-[12.5px]',
        )}
      >
        {uuid ?? '—'}
      </code>

      <button
        type="button"
        onClick={copy}
        disabled={!uuid}
        aria-label={`${caption} 복사하기`}
        title="복사하기"
        className={cn(
          'grid shrink-0 place-items-center rounded-full font-bold text-brand-600 transition-colors disabled:opacity-40 dark:text-brand-400',
          size === 'sm' ? 'size-6 text-[11px]' : 'size-7 text-[12px]',
        )}
        style={{ background: 'var(--surface-sunken)' }}
      >
        ⧉
      </button>
    </div>
  )
}
