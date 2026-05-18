from observer_practice.canal import CanalNoticias
from observer_practice.suscriptores import SuscriptorEmail, SuscriptorSMS


def test_suscriptor_email_guarda_mensajes():
    suscriptor = SuscriptorEmail("Ana")

    suscriptor.actualizar("Primera noticia")

    assert suscriptor.nombre == "Ana"
    assert suscriptor.canal == "email"
    assert suscriptor.mensajes == ["Primera noticia"]
    assert "Ana" in str(suscriptor)


def test_canal_notifica_a_todos_los_suscriptores():
    canal = CanalNoticias("Python al dia")
    email = SuscriptorEmail("Ana")
    sms = SuscriptorSMS("Luis")

    canal.suscribir(email)
    canal.suscribir(sms)
    canal.publicar("Nueva clase sobre Observer")

    assert canal.ultimo_mensaje == "Nueva clase sobre Observer"
    assert email.mensajes == ["Nueva clase sobre Observer"]
    assert sms.mensajes == ["Nueva clase sobre Observer"]


def test_desuscribir_detiene_nuevas_notificaciones():
    canal = CanalNoticias("Python al dia")
    email = SuscriptorEmail("Ana")
    sms = SuscriptorSMS("Luis")

    canal.suscribir(email)
    canal.suscribir(sms)
    canal.publicar("Mensaje inicial")
    canal.desuscribir(email)
    canal.publicar("Mensaje solo para activos")

    assert email.mensajes == ["Mensaje inicial"]
    assert sms.mensajes == ["Mensaje inicial", "Mensaje solo para activos"]


def test_no_duplica_suscriptores():
    canal = CanalNoticias("Python al dia")
    email = SuscriptorEmail("Ana")

    canal.suscribir(email)
    canal.suscribir(email)
    canal.publicar("Sin duplicados")

    assert email.mensajes == ["Sin duplicados"]


def test_canales_son_independientes():
    python = CanalNoticias("Python")
    datos = CanalNoticias("Datos")
    email = SuscriptorEmail("Ana")

    python.suscribir(email)
    python.publicar("Patrones de diseno")
    datos.publicar("Analisis de datos")

    assert email.mensajes == ["Patrones de diseno"]
    assert python.ultimo_mensaje == "Patrones de diseno"
    assert datos.ultimo_mensaje == "Analisis de datos"

