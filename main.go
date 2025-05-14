package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client      *mongo.Client
	db          *mongo.Database
	messagesCol *mongo.Collection
	usersCol    *mongo.Collection
	upgrader    = websocket.Upgrader{}
	clients     = make(map[string]*websocket.Conn)
)

type Message struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Sender    string             `bson:"sender" json:"sender"`
	Receiver  string             `bson:"receiver,omitempty" json:"receiver,omitempty"` // empty for general chat
	Content   string             `bson:"content" json:"content"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username string             `bson:"username" json:"username"`
}

func main() {
	// Set Gin to release mode
	gin.SetMode(gin.ReleaseMode)

	// MongoDB connection
	ctx := context.Background()
	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI("mongodb+srv://Sarinja:CfJwJR5C8yrESU3B@ecriredb.pt0ryz0.mongodb.net/"))
	if err != nil {
		log.Fatalf("Erreur de connexion à MongoDB: %v", err)
	}
	defer client.Disconnect(ctx)

	// Vérifier la connexion
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Erreur de ping à MongoDB: %v", err)
	}

	log.Println("Connecté à MongoDB avec succès!")

	db = client.Database("chatapp")
	messagesCol = db.Collection("messages")
	usersCol = db.Collection("users")

	r := gin.Default()
	r.Static("/static", "./static")

	// Nouvelle route pour la page de connexion
	r.GET("/", func(c *gin.Context) {
		content, err := os.ReadFile("templates/login_page.html")
		if err != nil {
			c.String(http.StatusInternalServerError, "Erreur de lecture du fichier login.html")
			return
		}
		c.Header("Content-Type", "text/html")
		c.String(http.StatusOK, string(content))
	})

	// Route pour la page de chat
	r.GET("/chat", func(c *gin.Context) {
		content, err := os.ReadFile("templates/index.html")
		if err != nil {
			c.String(http.StatusInternalServerError, "Erreur de lecture du fichier index.html")
			return
		}
		c.Header("Content-Type", "text/html")
		c.String(http.StatusOK, string(content))
	})

	r.POST("/register", func(c *gin.Context) {
		var user User
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
			return
		}
		newUser, err := registerUser(ctx, user.Username)
		if err != nil {
			log.Printf("Erreur lors de l'insertion de l'utilisateur: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not register user"})
			return
		}
		c.JSON(http.StatusOK, newUser)
	})

	r.GET("/ws/:username", func(c *gin.Context) {
		username := c.Param("username")
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Erreur lors de la mise à niveau de la connexion WebSocket: %v", err)
			return
		}
		clients[username] = conn
		defer conn.Close()
		for {
			var msg Message
			if err := conn.ReadJSON(&msg); err != nil {
				delete(clients, username)
				break
			}
			msg.CreatedAt = time.Now()
			_, err := messagesCol.InsertOne(ctx, msg)
			if err != nil {
				log.Printf("Erreur lors de l'insertion du message: %v", err)
				continue
			}
			if msg.Receiver != "" {
				if dest, ok := clients[msg.Receiver]; ok {
					_ = dest.WriteJSON(msg)
				}
			} else {
				for user, client := range clients {
					if user != username {
						_ = client.WriteJSON(msg)
					}
				}
			}
		}
	})

	log.Println("Serveur démarré sur http://localhost:8080")
	r.Run(":8080")
}

func registerUser(ctx context.Context, username string) (*User, error) {
	user := User{Username: username}
	_, err := usersCol.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
