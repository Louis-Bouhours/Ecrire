package api

import (
	"context"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
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
	var user User
	err := usersCol.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur inconnu"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Mauvais mot de passe"})
		return
	}

	var messages []Message
	cursor, err := messagesCol.Find(context.TODO(), bson.M{"sender": username})
	if err == nil {
		defer cursor.Close(context.TODO())
		_ = cursor.All(context.TODO(), &messages)
	}

	c.JSON(http.StatusOK, gin.H{
		"username": user.Username,
		"avatar":   user.Avatar,
		"messages": messages,
	})
}
