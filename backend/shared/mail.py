import os
import smtplib
import ssl
from email.message import EmailMessage


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def send_email_verification_code(to_email: str, code: str) -> None:
    enabled = _env_bool("SMTP_ENABLED", False)
    if not enabled:
        return

    host = os.getenv("SMTP_HOST", "").strip()
    port = int(os.getenv("SMTP_PORT", "587").strip())
    username = os.getenv("SMTP_USERNAME", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    from_email = os.getenv("SMTP_FROM_EMAIL", username).strip()
    from_name = os.getenv("SMTP_FROM_NAME", "HomoNet").strip()

    use_tls = _env_bool("SMTP_USE_TLS", True)
    use_ssl = _env_bool("SMTP_USE_SSL", False)

    if not host:
        raise RuntimeError("SMTP_HOST is not configured")
    if not from_email:
        raise RuntimeError("SMTP_FROM_EMAIL is not configured")
    if username and not password:
        raise RuntimeError("SMTP_PASSWORD is not configured")

    subject = "Подтверждение email"
    body = (
        "Здравствуйте!\n\n"
        f"Ваш код подтверждения email: {code}\n\n"
        "Если вы не запрашивали этот код, просто проигнорируйте письмо.\n"
    )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg.set_content(body)

    timeout = 20

    if use_ssl:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(host, port, timeout=timeout, context=context) as server:
            if username:
                server.login(username, password)
            server.send_message(msg)
        return

    with smtplib.SMTP(host, port, timeout=timeout) as server:
        server.ehlo()
        if use_tls:
            context = ssl.create_default_context()
            server.starttls(context=context)
            server.ehlo()
        if username:
            server.login(username, password)
        server.send_message(msg)