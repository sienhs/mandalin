import { Fragment } from 'react'
import { wrapCellText } from './sheet.utils'

/** 칸 안의 글자를 좁은 칸에 맞게 필요한 만큼 두 줄로 나눠 보여준다. */
export default function SheetCellText({ text }: { text: string }) {
  return (
    <>
      {wrapCellText(text).map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  )
}
