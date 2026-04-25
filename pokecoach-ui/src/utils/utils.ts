export const getStatColor = (statName: string) => {
    switch (statName.toLowerCase()) {
        case "hp":
            return "bg-stat-hp";
        case "attack":
            return "bg-stat-attack";
        case "defense":
            return "bg-stat-defense";
        case "sp. atk":
            return "bg-stat-spatk";
        case "sp. def":
            return "bg-stat-spdef";
        case "speed":
            return "bg-stat-speed";
        default:
            return "bg-gray-500";
    }
}

export function formatName(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
