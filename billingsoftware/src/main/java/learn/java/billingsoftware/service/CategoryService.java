package learn.java.billingsoftware.service;

import learn.java.billingsoftware.io.CategoryRequest;
import learn.java.billingsoftware.io.CategoryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CategoryService {
    CategoryResponse add(CategoryRequest request, MultipartFile file) throws IOException;

    List<CategoryResponse> read();
    void delete(String categoryId);
    CategoryResponse create(CategoryRequest request);
}
