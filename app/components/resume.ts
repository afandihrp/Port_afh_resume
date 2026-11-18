export const RESUME_PATH = "/resume_cv.pdf";
const RESUME_FILENAME = "M-Afandi-Harahap-Resume.pdf";

export function downloadResume() {
  const link = document.createElement("a");
  link.href = RESUME_PATH;
  link.download = RESUME_FILENAME;
  document.body.append(link);
  link.click();
  link.remove();
}
