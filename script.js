const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const statusMessage = contactForm.querySelector(".form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');

  const setStatus = (message) => {
    if (statusMessage) {
      statusMessage.textContent = message;
    }
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "전송 중..." : "상담 신청 보내기";
  };

  const buildMailtoUrl = (formData) => {
    const recipient = contactForm.dataset.recipient || "0x00@kakao.com";
    const subject = formData.get("_subject") || "Pocket Base 상담 신청";
    const lines = [
      `이름: ${formData.get("name") || ""}`,
      `연락처: ${formData.get("phone") || ""}`,
      `이메일: ${formData.get("email") || ""}`,
      "",
      "[문의 내용]",
      formData.get("message") || "",
    ];
    const body = lines.join("\n");

    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const openMailClient = (formData) => {
    window.location.href = buildMailtoUrl(formData);
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    if (window.location.protocol === "file:") {
      setStatus("로컬 미리보기에서는 메일 작성 창으로 연결합니다.");
      openMailClient(formData);
      return;
    }

    setSubmitting(true);
    setStatus("상담 신청을 전송하고 있습니다.");

    try {
      const ajaxEndpoint = contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

      const response = await fetch(ajaxEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("request_failed");
      }

      const result = await response.json();

      if (result.success !== true && result.success !== "true") {
        throw new Error("submission_failed");
      }

      contactForm.reset();
      setStatus("상담 신청이 전송되었습니다. 확인 후 빠르게 연락드리겠습니다.");
    } catch (error) {
      setStatus("전송 환경이 원활하지 않아 메일 작성 창으로 연결합니다.");
      openMailClient(formData);
    } finally {
      setSubmitting(false);
    }
  });
}
