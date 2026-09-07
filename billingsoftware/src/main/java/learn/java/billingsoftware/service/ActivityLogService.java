package learn.java.billingsoftware.service;

import learn.java.billingsoftware.io.ActivityLogPageResponse;

public interface ActivityLogService {
    void logActivity(String userEmail, String action, String entityType, String entityId, String description);
    void logActivity(String action, String entityType, String entityId, String description);
    ActivityLogPageResponse getActivityLogs(int page, int size, String userEmail, String action, String startDate, String endDate, String authenticatedEmail, boolean isAdmin);
}
