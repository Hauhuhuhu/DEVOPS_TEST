package learn.java.billingsoftware.controller;

import learn.java.billingsoftware.io.ModifierGroupRequest;
import learn.java.billingsoftware.io.ModifierGroupResponse;
import learn.java.billingsoftware.service.ModifierGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ModifierGroupController {

    private final ModifierGroupService modifierGroupService;

    @PostMapping("/admin/modifier-groups")
    @ResponseStatus(HttpStatus.CREATED)
    public ModifierGroupResponse createModifierGroup(@RequestBody ModifierGroupRequest request) {
        return modifierGroupService.create(request);
    }

    @GetMapping("/modifier-groups")
    public List<ModifierGroupResponse> getAllModifierGroups() {
        return modifierGroupService.fetchAll();
    }

    @GetMapping("/modifier-groups/{groupId}")
    public ModifierGroupResponse getModifierGroupById(@PathVariable("groupId") String groupId) {
        return modifierGroupService.fetchById(groupId);
    }

    @PutMapping("/admin/modifier-groups/{groupId}")
    public ModifierGroupResponse updateModifierGroup(@PathVariable("groupId") String groupId,
                                                     @RequestBody ModifierGroupRequest request) {
        return modifierGroupService.update(groupId, request);
    }

    @DeleteMapping("/admin/modifier-groups/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteModifierGroup(@PathVariable("groupId") String groupId) {
        modifierGroupService.delete(groupId);
    }

    @PostMapping("/admin/items/{itemId}/modifier-groups")
    public void attachModifierGroups(@PathVariable("itemId") String itemId,
                                     @RequestBody List<String> groupIds) {
        modifierGroupService.attachToItem(itemId, groupIds);
    }

    @GetMapping("/items/{itemId}/modifier-groups")
    public List<ModifierGroupResponse> getItemModifierGroups(@PathVariable("itemId") String itemId) {
        return modifierGroupService.fetchByItemId(itemId);
    }
}
