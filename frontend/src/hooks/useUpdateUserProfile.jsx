import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {

    const queryClient = useQueryClient();

    // Mutate function for updating the user profile image and cover image. (** Other profiles are handled in the edit profile modal.)
	const {
		mutateAsync:updateProfile,
		isPending:isUpdatingProfile
	} = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/users/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
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
		onSuccess: () => {
			toast.success("Profile updated successfully");
			// after success, we want to invalidate the queries used in the profile section (profile photo + cover img) and the authenticated user on the bottom left. 
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"]}),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});  
    
    // Return function and the loading state
    return { updateProfile, isUpdatingProfile }
}

export default useUpdateUserProfile;
