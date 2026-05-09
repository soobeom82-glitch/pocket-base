const filterButtons = document.querySelectorAll(".filter-button");
const branchCards = document.querySelectorAll(".branch-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { filter } = button.dataset;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    branchCards.forEach((card) => {
      const matches = filter === "all" || card.dataset.region === filter;
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.alert("문의 폼은 예시 상태입니다. 실제 전송 연동은 다음 단계에서 연결할 수 있어요.");
  });
}
