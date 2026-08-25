import math
from typing import List, Dict, Any, Optional, Tuple

class SpatialService:
    """
    Spatial operations abstraction supporting accurate geodesic distance calculations,
    zone bounding checks, and nearest infrastructure asset correlation.
    """
    EARTH_RADIUS_METERS = 6371000.0

    @classmethod
    def calculate_distance_meters(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculates exact Haversine distance in meters between two geodetic coordinates.
        """
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (
            math.sin(delta_phi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return cls.EARTH_RADIUS_METERS * c

    @classmethod
    def find_nearest_asset(
        cls,
        lat: float,
        lon: float,
        assets: List[Dict[str, Any]],
        max_distance_m: float = 5000.0
    ) -> Tuple[Optional[Dict[str, Any]], float]:
        """
        Finds the closest infrastructure asset within max_distance_m threshold.
        """
        best_asset = None
        min_dist = float("inf")

        for asset in assets:
            a_lat = asset.get("latitude")
            a_lon = asset.get("longitude")
            if a_lat is None or a_lon is None:
                continue

            dist = cls.calculate_distance_meters(lat, lon, float(a_lat), float(a_lon))
            if dist < min_dist:
                min_dist = dist
                best_asset = asset

        if best_asset and min_dist <= max_distance_m:
            return best_asset, round(min_dist, 1)
        return None, round(min_dist, 1) if best_asset else 0.0

    @classmethod
    def is_valid_coimbatore_coordinate(cls, lat: float, lon: float) -> bool:
        """
        Validates if coordinate falls within the Coimbatore metropolitan bounding box.
        """
        return 10.85 <= lat <= 11.20 and 76.80 <= lon <= 77.15
