const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const statusMessage = contactForm.querySelector(".form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

  const setStatus = (message, type = "info") => {
    if (!statusMessage) {
      return;
    }

    statusMessage.textContent = message;
    statusMessage.classList.toggle("is-error", type === "error");
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "전송 중..." : defaultButtonLabel;
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const ajaxEndpoint = contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

    setSubmitting(true);
    setStatus("상담 신청을 전송하고 있습니다.");

    try {
      const response = await fetch(ajaxEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`request_failed_${response.status}`);
      }

      const result = await response.json();

      if (result.success !== true && result.success !== "true") {
        throw new Error("submission_failed");
      }

      contactForm.reset();
      setStatus("상담 신청이 접수되었습니다. 확인 후 빠르게 연락드리겠습니다.");
    } catch (error) {
      setStatus(
        "외부 전송 서비스에 일시적인 문제가 있어 접수가 완료되지 않았습니다. 잠시 후 다시 시도하시거나 010-2846-0544로 연락 부탁드립니다.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  });
}
