import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
    const queryClient = useQueryClient();

    const {
        mutate:followUnfollow, 
        isPending, 
    } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: "POST",
                });

                const data = await res.json();
                if(!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                return data;

            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess:() => {
            Promise.all([
                // Invalidate suggested users section (first location where user can follow/unfollow)
                queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
                // Invalidate authUser to refresh profile (second location where user can follow/unfollow)
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),
            ]);          
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return { followUnfollow, isPending };
}


export default useFollow;