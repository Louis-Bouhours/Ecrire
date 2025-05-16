package api

import (
	"context"
	"github.com/Sarinja-Corp/Ecrire/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func LoginUserRoutes(r *gin.Engine) {
	r.POST("/api/login", apiUserLogin)
}

func apiUserLogin(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&body); err != nil || body.Username == "" || body.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Champs requis"})
		return
	}

	var user models.User
	err := models.UsersCol.FindOne(context.TODO(), bson.M{"username": body.Username}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur ou mot de passe invalide"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur ou mot de passe invalide"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"username": user.Username,
		"avatar":   user.Avatar,
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken, // ton JWT d'accès
		HttpOnly: true,
		Secure:   true, // si HTTPS
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
		MaxAge:   3600, // 1h
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400, // 1 jour
	})

}
