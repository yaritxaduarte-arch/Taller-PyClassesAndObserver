from typing import Protocol


class Observador(Protocol):
    def actualizar(self, mensaje):
        ...