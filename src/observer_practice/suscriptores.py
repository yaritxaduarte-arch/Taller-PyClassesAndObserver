class SuscriptorEmail:
    def __init__(self, nombre):
        self.nombre = nombre
        self.canal = "email"
        self.mensajes = []

    def actualizar(self, mensaje):
        self.mensajes.append(mensaje)

    def __str__(self):
        return f"{self.nombre} por {self.canal}"