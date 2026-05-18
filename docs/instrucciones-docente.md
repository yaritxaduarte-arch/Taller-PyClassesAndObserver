# Instrucciones para docentes

## Uso como plantilla

Este repositorio esta pensado como una practica guiada para cursos introductorios o intermedios de Python.

Puedes publicarlo como template, pedir a cada estudiante que cree su copia y solicitar que active GitHub Actions. El workflow **Iniciar practica** se ejecuta con el primer `push` a `main` o manualmente desde la pestaña **Actions**, crea la primera mision y luego elimina su propio archivo para no volver a ejecutarse. Las siguientes misiones se crean conforme el estudiante cumple los criterios.

El workflow de inicio tiene una guarda para no ejecutarse cuando el repositorio esta marcado como **Template repository**. Asi el repositorio base conserva el archivo y solo las copias de estudiantes lo eliminan despues de crear la primera mision.

El `README.md` es la guía principal para estudiantes.

## Secuencia didactica

La practica cubre:

- creacion y uso de entorno virtual;
- instalacion de dependencias con `requirements.txt`;
- estructura de paquete con `src/`;
- clases, atributos y metodos;
- modelado del patron Observer;
- demo ejecutable;
- pruebas con `pytest`;
- README tecnico;
- calificacion automatica sobre 100.

## Evaluacion sugerida

La calificacion automatica se calcula desde `scripts/validate-python-practice.js`:

- 10 puntos: entorno virtual documentado y dependencias.
- 10 puntos: estructura de paquete.
- 15 puntos: clase `SuscriptorEmail`.
- 10 puntos: `SuscriptorSMS` y contrato de observador.
- 15 puntos: clase `CanalNoticias`.
- 20 puntos: comportamiento Observer.
- 10 puntos: demo ejecutable.
- 10 puntos: README final.

La revision automatica ayuda a dar retroalimentacion rapida, pero puedes complementarla con lectura de codigo, sustentacion oral o preguntas cortas sobre el patron.

## Ajustar misiones

La secuencia de issues esta en:

```text
scripts/practice-missions.js
```

La logica de validacion y puntaje esta en:

```text
scripts/validate-python-practice.js
scripts/validate-progress.js
```

Si cambias nombres de clases o archivos, actualiza tambien `tests/test_observer.py` y los criterios de calificacion.
