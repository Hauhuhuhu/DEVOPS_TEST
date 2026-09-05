package learn.java.billingsoftware.service;

import learn.java.billingsoftware.io.ModifierGroupRequest;
import learn.java.billingsoftware.io.ModifierGroupResponse;

import java.util.List;

public interface ModifierGroupService {
    ModifierGroupResponse create(ModifierGroupRequest request);
    List<ModifierGroupResponse> fetchAll();
    ModifierGroupResponse fetchById(String groupId);
    ModifierGroupResponse update(String groupId, ModifierGroupRequest request);
    void delete(String groupId);
    void attachToItem(String itemId, List<String> groupIds);
    List<ModifierGroupResponse> fetchByItemId(String itemId);
    ModifierGroupResponse convertToResponse(learn.java.billingsoftware.entity.ModifierGroupEntity entity);
}
