import type {
  DepartmentTable,
  MemberCreditTable,
  MemberSubjectTable,
  MemberTable,
  SubjectTable,
} from './tables/index.js'

export const autoload = false

export interface Database {
  /**
   * 사용자
   */
  member: MemberTable

  /**
   * 학과
   */
  department: DepartmentTable

  /**
   * 교과목
   */
  subject: SubjectTable

  /**
   * 사용자가 수강한 교과목
   */
  memberSubject: MemberSubjectTable

  /**
   * 사용자가 수강한 교과목
   */
  memberCreditGroup: MemberCreditGroupTable

  /**
   * 사용자가 수강한 교과목
   */
  memberCredit: MemberCreditTable
}
