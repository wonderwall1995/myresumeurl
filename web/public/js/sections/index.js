// 섹션 종류와 그리기 함수의 대응표.
// 데이터의 type 값이 이 표의 키와 같아야 한다.
// 새 종류를 추가할 때는 렌더러 파일을 만들고 여기에 한 줄을 추가한다.
import { renderIntro } from "./intro.js";
import { renderCareer } from "./career.js";
import { renderEducation } from "./education.js";
import { renderHistory } from "./history.js";
import { renderProjects } from "./projects.js";
import { renderEtc } from "./etc.js";

export const renderers = {
  intro: renderIntro,
  career: renderCareer,
  education: renderEducation,
  history: renderHistory,
  projects: renderProjects,
  etc: renderEtc,
};
