package main

import (
	"context"
	"fmt"
	"github.com/Sarinja-Corp/Ecrire/api"
	"github.com/Sarinja-Corp/Ecrire/auth"
	"github.com/Sarinja-Corp/Ecrire/chat"
	"github.com/Sarinja-Corp/Ecrire/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"os"
)

func main() {
	auth.InitRedis()
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	chat.SetupSocketIO(router)
	router.Static("/static", "./static")
	router.LoadHTMLGlob("templates/*")
	router.Run(":8080")

	r := gin.Default()

	r.POST("/login", auth.LoginHandler)
	r.POST("/logout", auth.LogoutHandler)
	r.Static("/static", "./static")

	r.GET("/profile", auth.AuthRequired(), func(c *gin.Context) {
		username := c.GetString("username")
		c.JSON(200, gin.H{"message": "Bienvenue " + username})
	})

	r.GET("/", func(c *gin.Context) {
		content, err := os.ReadFile("templates/login_page.html")
		if err != nil {
			c.String(500, "Erreur lecture login_page.html")
			return
		}
		c.Header("Content-Type", "text/html")
		c.String(200, string(content))
	})

	r.GET("/chat", func(c *gin.Context) {
		content, err := os.ReadFile("templates/index.html")
		if err != nil {
			c.String(500, "Erreur lecture index.html")
			return
		}
		c.Header("Content-Type", "text/html")
		c.String(200, string(content))
	})

	fmt.Println("api.client")
	fmt.Println("api.db")

	ctx := context.Background()
	var err error
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb+srv://Sarinja:CfJwJR5C8yrESU3B@ecriredb.pt0ryz0.mongodb.net/"))
	if err != nil {
		log.Fatalf("Erreur MongoDB: %v", err)
	}
	defer func(client *mongo.Client, ctx context.Context) {
		err := client.Disconnect(ctx)
		if err != nil {
			log.Fatalf("Erreur déconnexion MongoDB: %v", err)
		}
	}(client, ctx)
	if err = client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB indisponible!")
	}
	log.Println("MongoDB connecté.")

	models.Client = client
	models.UsersCol = client.Database("EcrireDB").Collection("users")

	// Inclusion des routes API
	api.RegisterUserRoutes(r)
	api.LoginUserRoutes(r)
	api.LogoutUserRoutes(r)

	log.Println("Serveur sur http://localhost:8080")
	err = r.Run(":8080")
	if err != nil {
		log.Fatalf("Erreur serveur: %v", err)
	}
}
