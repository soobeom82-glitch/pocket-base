const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.alert("문의 폼은 예시 상태입니다. 실제 전송 연동은 다음 단계에서 연결할 수 있어요.");
  });
}
