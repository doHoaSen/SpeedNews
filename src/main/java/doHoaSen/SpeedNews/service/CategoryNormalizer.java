package doHoaSen.SpeedNews.service;

public class CategoryNormalizer {
    public static String normalize(String raw){
        if (raw == null || raw.isBlank()) return null;

        if (raw.contains("|")) {
            return raw.split("\\|")[0];
        }

        return raw.trim();
    }
}
