class CanalNoticias:
    def __init__(self, nombre):
        self.nombre = nombre
        self.observadores = []
        self.ultimo_mensaje = None

    def suscribir(self, observador):
        if observador not in self.observadores:
            self.observadores.append(observador)

    def desuscribir(self, observador):
        if observador in self.observadores:
            self.observadores.remove(observador)

    def notificar(self, mensaje):
        for observador in self.observadores:
            observador.actualizar(mensaje)

    def publicar(self, mensaje):
        self.ultimo_mensaje = mensaje
        self.notificar(mensaje)