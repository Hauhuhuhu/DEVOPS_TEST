package learn.java.billingsoftware.service;

import learn.java.billingsoftware.io.UserRequest;
import learn.java.billingsoftware.io.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request);
    String getUserRole(String email);
    List<UserResponse> readUsers();
    void deleteUser(String id);
}
