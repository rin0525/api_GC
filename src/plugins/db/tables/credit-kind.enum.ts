export const autoload = false

export enum CreditKind {
  /**
   * 인성 교양
   */
  TENACITY_LIBERAL_ARTS = 'TENACITY_LIBERAL_ARTS',

  /**
   * 필수 교양
   */
  REQUIRED_LIBERAL_ARTS = 'REQUIRED_LIBERAL_ARTS',

  /**
   * 일반 교양
   */
  GENERAL_LIBERAL_ARTS = 'GENERAL_LIBERAL_ARTS',

  /**
   * 일반 자유
   */
  GENERAL = 'GENERAL',

  /**
   * 기초 전공
   */
  BASIC_MAJOR = 'BASIC_MAJOR',

  /**
   * 필수 전공
   */
  REQUIRED_MAJOR = 'REQUIRED_MAJOR',

  /**
   * 선택 전공
   */
  OPTIONAL_MAJOR = 'OPTIONAL_MAJOR',

  /**
   * 채플
   */
  CHAPEL = 'CHAPEL',

  /**
   * 봉사
   */
  VOLUNTEER = 'VOLUNTEER',
}
