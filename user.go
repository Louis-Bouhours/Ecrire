package main

import (
	"context"
)

func registerUser(ctx context.Context, username string) (*User, error) {
	user := User{Username: username}
	_, err := usersCol.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
