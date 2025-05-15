package api

import (
	"context"
	"github.com/Sarinja-Corp/Ecrire/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func LoginUserRoutes(r *gin.Engine) {
	r.GET("/api/login", apiUserLogin)
}

// Connexion, infos utilisateur + avatar + messages
func apiUserLogin(c *gin.Context) {
	username := c.Query("username")
	password := c.Query("password")
	if username == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Champs requis"})
		return
	}
	var user models.User
	err := models.UsersCol.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur inconnu"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Mauvais mot de passe"})
		return
	}

	var messages []models.Message
	cursor, err := models.MessagesCol.Find(context.TODO(), bson.M{"sender": username})
	if err == nil {
		defer func(cursor *mongo.Cursor, ctx context.Context) {
			err := cursor.Close(ctx)
			if err != nil {

			}
		}(cursor, context.TODO())
		_ = cursor.All(context.TODO(), &messages)
	}

	c.JSON(http.StatusOK, gin.H{
		"username": user.Username,
		"avatar":   user.Avatar,
		"messages": messages,
	})
}
