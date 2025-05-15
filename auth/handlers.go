package auth

import (
	"context"
	"github.com/Sarinja-Corp/Ecrire/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"net/http"
	_ "time"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requête invalide"})
		return
	}

	var user bson.M
	err := models.UsersCol.FindOne(context.TODO(), bson.M{"username": req.Username, "password": req.Password}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identifiants incorrects"})
		return
	}

	userID := user["_id"].(interface{})

	token, err := GenerateJWT(userID.(string), req.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur génération JWT"})
		return
	}

	c.SetCookie("token", token, 3600*24, "/", "", true, true)
	c.JSON(http.StatusOK, gin.H{"message": "Connecté avec succès"})
}

func LogoutHandler(c *gin.Context) {
	c.SetCookie("token", "", -1, "/", "", true, true)
	c.JSON(http.StatusOK, gin.H{"message": "Déconnecté"})
}
