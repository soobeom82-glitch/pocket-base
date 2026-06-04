const contactForm = document.querySelector("#contact-form");

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

  const buildPayload = () => ({
    name: contactForm.elements.name.value.trim(),
    phone: contactForm.elements.phone.value.trim(),
    email: contactForm.elements.email.value.trim(),
    message: contactForm.elements.message.value.trim(),
  });

  const mapErrorMessage = (message) => {
    if (message === "Missing TELEGRAM_BOT_TOKEN environment variable") {
      return "배포 환경에 텔레그램 봇 토큰 설정이 아직 적용되지 않았습니다.";
    }

    if (message === "Missing required fields") {
      return "연락처만 입력하면 전송할 수 있습니다. 연락처를 확인해주세요.";
    }

    if (message === "Telegram delivery failed") {
      return "텔레그램 전송 중 문제가 발생했습니다. 잠시 후 다시 시도하시거나 010-2846-0544로 연락 부탁드립니다.";
    }

    return "상담 신청 전송에 문제가 발생했습니다. 잠시 후 다시 시도하시거나 010-2846-0544로 연락 부탁드립니다.";
  };

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (window.location.protocol === "file:") {
      setStatus("로컬 미리보기에서는 전송되지 않습니다. 배포된 페이지에서 테스트해주세요.", "error");
      return;
    }

    const payload = buildPayload();

    setSubmitting(true);
    setStatus("텔레그램으로 상담 신청을 전송하고 있습니다.");

    fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      .then((response) =>
        response.json().then((result) => ({
          ok: response.ok,
          result,
        }))
      )
      .then(({ ok, result }) => {
        if (!ok || !result.ok) {
          throw new Error(result.message || "request_failed");
        }

        contactForm.reset();
        setStatus("상담 신청이 접수되었습니다. 확인 후 빠르게 연락드리겠습니다.");
      })
      .catch((error) => {
        setStatus(mapErrorMessage(error.message), "error");
      })
      .then(() => {
        setSubmitting(false);
      });
  });
}
