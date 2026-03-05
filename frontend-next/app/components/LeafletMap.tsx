// Exported type for map locations — used by LiveUserMap and other components
export interface MapLocation {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
    status?: string;
}
