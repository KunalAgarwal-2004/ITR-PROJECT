import { useAuth } from './useAuth';

/**
 * Destinations for marketing call-to-action buttons ("Hire Talent", "Post a Job",
 * "Join as a Freelancer"). Guests go to signup with the right role preselected;
 * signed-in users go straight to the matching place in their workspace.
 */
export const useCtaPaths = () => {
  const { isAuthenticated, isClient, isFreelancer } = useAuth();

  // ?post=1 opens the "Post a Job" form on the client dashboard
  const postJob = isClient ? '/dashboard/client?post=1' : '/signup?role=client';

  return {
    postJob,
    hire: isAuthenticated && !isClient ? '/freelancers' : postJob,
    findWork: isFreelancer ? '/jobs' : isAuthenticated ? '/jobs' : '/signup?role=freelancer',
    joinAsFreelancer: isFreelancer ? '/dashboard/freelancer' : '/signup?role=freelancer'
  };
};

export default useCtaPaths;
