# Secret Santa

### Pasos para poner en funcionamiento la aplicación:
1. Crear un proyecto en Firebase
2. Crear una Realtime Database en Firebase
3. Copiar las keys generadas por Firebase en index.html
4. Tener en cuenta que el nombre de la base de datos se pasa por query param porque el proyecto se planteo para 2 bases de datos al mismo tiempo.

   Si no se le pasa el nombre (NOCHEBUENA o NAVIDAD) por parametro no cargará los datos

___
### Funcionamiento de la APP

1. Ingresar el nombre de los participantes en el código
2. Desplegar la aplicación
3. Para crear y asignar a los participantes sus amigos invisibles se tiene que llamar desde la CONSOLA a la funcion **`generateAndAssignParticipants()`**
4. Una vez que se crearon, cada participante podra entrar a la página, seleccionar su nombre y se le mostrará su amigo invisible.


---
### La aplicación se despliega con Github Pages

Si el repositorio esta en Privado, poner en Público para que se active.
La url será:
- https://gonzalogarcia2318.github.io/secret-santa?evento=NOCHEBUENA
- https://gonzalogarcia2318.github.io/secret-santa?evento=NAVIDAD
