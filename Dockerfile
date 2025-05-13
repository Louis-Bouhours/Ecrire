# Utilise une image officielle de Go comme base
FROM golang:latest

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le code source de l'application dans le conteneur
COPY . .

# Compiler l'application
RUN go build -o myapp

# Exposer le port sur lequel l'application écoute
EXPOSE 8080

# Commande pour exécuter l'application
CMD ["./myapp"]
