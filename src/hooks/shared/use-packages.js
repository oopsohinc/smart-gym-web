import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizePackagesResponse } from "@/services/package.service";

export const usePackages = () =>
  useQuery({
    queryKey: ["/packages"],
    queryFn: async () => normalizePackagesResponse((await api.get("/packages")).data),
  });
