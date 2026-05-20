from observer_practice.canal import CanalNoticias
from observer_practice.suscriptores import (
    SuscriptorEmail,
    SuscriptorSMS
)


def main():
    canal = CanalNoticias("Bienvenidos a el mejor canal de noticias 😛😛")

    ana = SuscriptorEmail("Ana")
    yari = SuscriptorSMS("yari")

    canal.suscribir(ana)
    canal.suscribir(yari)

    canal.publicar("Nuevo chisme del dia ")

    print(ana.mensajes)
    print(yari.mensajes)


if __name__ == "__main__":
    main()