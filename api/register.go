package api

import (
	"context"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

// Pour être cohérent, mets la struct User dans models.go, sinon recolle là ici

func RegisterUserRoutes(r *gin.Engine) {
	r.GET("/api/register", apiUserCheckExist)
	r.POST("/api/register", apiUserRegister)
}

// Vérifie si le pseudo existe déjà
func apiUserCheckExist(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nom d'utilisateur requis"})
		return
	}
	count, err := usersCol.CountDocuments(context.TODO(), bson.M{"username": username})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur base de données"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"exists": count > 0})
}

// Inscription utilisateur
func apiUserRegister(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Avatar   string `json:"avatar"`
	}
	if err := c.BindJSON(&body); err != nil || body.Username == "" || body.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload invalide"})
		return
	}
	count, err := usersCol.CountDocuments(context.TODO(), bson.M{"username": body.Username})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur base"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nom déjà pris"})
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur serveur"})
		return
	}
	newUser := User{Username: body.Username, Password: string(hashed), Avatar: body.Avatar}
	_, err = usersCol.InsertOne(context.TODO(), newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur création utilisateur"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"username": newUser.Username, "avatar": newUser.Avatar})
}
