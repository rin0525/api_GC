import _ from 'lodash'
import * as R from 'rambda'
import * as XLSX from 'xlsx'
import { CreditKind } from '../../plugins/db/index.js'

export const autoload = false

interface Credit {
  kind: CreditKind

  required: number | null

  acquired: number
}

/**
 * 엑셀에서 학점을 불러올때 각 학점별 엑셀 범위
 */
const CREDIT_KIND_RANGE_MAP: Record<CreditKind, string> = {
  [CreditKind.TENACITY_LIBERAL_ARTS]: 'C9:C10',
  [CreditKind.REQUIRED_LIBERAL_ARTS]: 'D9:D10',
  [CreditKind.GENERAL_LIBERAL_ARTS]: 'H9:H10',
  [CreditKind.REQUIRED_MAJOR]: 'O9:O10',
  [CreditKind.OPTIONAL_MAJOR]: 'M9:M10',
  [CreditKind.CHAPEL]: 'AM9',
  [CreditKind.VOLUNTEER]: 'AM11',
  [CreditKind.GENERAL]: 'Z9:Z10',
  [CreditKind.BASIC_MAJOR]: 'J9:J10',
} as const

/**
 * 엑셀 처리
 */
export class SheetProcessor {
  /**
   * 학점 영역
   */
  #creditRange = 'C9:Z10'

  readonly #worksheet: XLSX.WorkSheet

  constructor(worksheet: XLSX.WorkSheet) {
    this.#worksheet = worksheet
  }

  /**
   * 모든 학점 정보를 가져옵니다
   */
  getCredits(): Credit[] {
    const credits = R.pipe(
      R.mapObjIndexed((value: string, key: string) => this.#getCredit(key as CreditKind, value)),
      R.values,
    )(CREDIT_KIND_RANGE_MAP)

    return credits
  }

  /**
   * 특정 학점을 가져옵니다
   */
  #getCredit(kind: CreditKind, range: string) {
    // 지정된 범위의 셀 데이터를 불러옵니다
    const credits = XLSX.utils.sheet_to_json<string[]>(this.#worksheet, {
      range,
      header: 1,
    })

    const [[_required], _acquired] = credits

    // 취득 학점을 String 으로 가져옵니다
    let acquiredStr = Array.isArray(_acquired) ? _acquired[0] : _required

    // 필요 학점을 String 으로 가져옵니다
    let requiredStr = Array.isArray(_acquired) ? _required : undefined

    // 필요학점에 괄호가 포함되어 있는 경우 괄호를 제거합니다
    if (requiredStr?.includes('(')) {
      requiredStr = requiredStr.replace(/\(.*\)/, '')
    }

    // 취득학점에 P 가 포함되어 있는 경우 P 를 제거합니다
    if (acquiredStr.includes('P')) {
      acquiredStr = acquiredStr.replace('P', '').trim()
    }

    return { kind, required: this.toNumberOrNull(requiredStr as string), acquired: Number.parseInt(acquiredStr) }
  }

  /**
   * Number 로 파싱하고 NaN 인 경우 null 을 리턴합니다
   */
  toNumberOrNull(numberLike: string): number | null {
    const num = Number.parseInt(numberLike)
    return !Number.isNaN(num) ? num : null
  }

  /**
   * 이수과목을 모두 불러옵니다
   */
  getSubjects() {
    const ranges = ['A18:P65', 'X18:AR65']
    const subjects = ranges.flatMap((range) => this.#getSubjectsInRange(range))
    return subjects
  }

  /**
   * 해당 범위의 이수 교과목을 가져옵니다
   */
  #getSubjectsInRange(range: string) {
    const subjects = XLSX.utils
      .sheet_to_json<string[]>(this.#worksheet, {
        range,
        header: 1,
      })
      .map((arr) => arr.filter((arr) => arr.length > 0))
      .filter((arr) => arr.length === 6)

    return subjects.map(([kind, subjectId, subjectName, yearAndSemester, credit, grade]) => {
      const [year, semester] = yearAndSemester.replaceAll('학기', '').split('/')
      return {
        kind,
        subjectId,
        subjectName,
        year: Number.parseInt(year),
        semester: Number.parseInt(semester),
        credit: Number.parseInt(credit),
        grade,
      }
    })
  }
}
