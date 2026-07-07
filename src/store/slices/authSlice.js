import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/UI/axiosInstance';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  profilePicUrl: null, // Store the full URL for profile picture
  communities: [], // To store user's communities
};

// Ensure axios has the Authorization header when the app initializes
if (initialState.token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${initialState.token}`;
}

// =============================================
// 1. LOGIN USER
// =============================================
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', userData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set authorization header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed'
      );
    }
  }
);

// =============================================
// 2. LOGOUT USER
// =============================================
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Optional: Call backend to invalidate token
      // await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Server logout failed, proceeding with client-side logout.', err);
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove authorization header
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    return;
  }
);

// =============================================
// 3. UPDATE USER PROFILE (with GridFS)
// =============================================
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (formData, { getState, rejectWithValue }) => {
    try {
      // Log what's being sent (for debugging)
      console.log('🔄 Updating profile with FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }

      // Send the FormData directly; axios will set the proper multipart boundary.
      const response = await axiosInstance.put('/user/profile', formData);

      // Get current user from state
      const state = getState();
      const currentUser = state.auth.user || {};
      
      // Merge updated data
      let updatedUser = { 
        ...currentUser, 
        ...response.data 
      };

      if (response.data.profilePic) {
        updatedUser.profilePic = `${response.data.profilePic}${response.data.profilePic.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
      }
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ Profile updated successfully:', updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('❌ Profile update failed:', err);
      return rejectWithValue(
        err.response?.data?.message || 'Profile update failed'
      );
    }
  }
);

// =============================================
// 4. GET USER PROFILE
// =============================================
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/user/profile');
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

// =============================================
// 5. FORGOT PASSWORD
// =============================================
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to send password reset email'
      );
    }
  }
);

// =============================================
// 5. FETCH USER COMMUNITIES
// =============================================
export const fetchUserCommunities = createAsyncThunk(
  'auth/fetchUserCommunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/user/communities');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch communities'
      );
    }
  }
);

// =============================================
// 6. REGISTER USER
// =============================================
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// =============================================
// 7. COMPLETE REGISTRATION
// =============================================
export const completeRegistration = createAsyncThunk(
  'auth/completeRegistration',
  async ({ username, password, publicKey, token }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/auth/create-user',
        { username, password, publicKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Account creation failed'
      );
    }
  }
);

// =============================================
// 7. DELETE USER ACCOUNT
// =============================================
export const deleteUserAccount = createAsyncThunk(
  'auth/deleteUserAccount',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/user/profile');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Remove authorization header
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      return;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete account'
      );
    }
  }
);

// =============================================
// AUTH SLICE
// =============================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear errors
    clearAuthError: (state) => {
      state.error = null;
    },
    // Reset status
    resetAuthStatus: (state) => {
      state.status = 'idle';
    },
    // Update user locally (for optimistic updates)
    updateUserLocally: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    // Set profile picture URL
    setProfilePicUrl: (state, action) => {
      state.profilePicUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== LOGIN =====
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        // Store profile picture URL if exists
        if (action.payload.user?.profilePic) {
          state.profilePicUrl = action.payload.user.profilePic;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
        state.token = null;
      })

      // ===== LOGOUT =====
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
        state.profilePicUrl = null;
      })

      // ===== UPDATE PROFILE =====
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        // Update profile picture URL if it changed
        if (action.payload?.profilePic) {
          state.profilePicUrl = action.payload.profilePic;
        }
        console.log('✅ Auth state updated with new user data');
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ===== GET USER PROFILE =====
      .addCase(getUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        if (action.payload?.profilePic) {
          state.profilePicUrl = action.payload.profilePic;
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ===== FETCH USER COMMUNITIES =====
      .addCase(fetchUserCommunities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserCommunities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.communities = action.payload;
      })
      .addCase(fetchUserCommunities.rejected, (state, action) => {
        state.status = 'failed';
        // Keep existing communities on error, but log the error
        state.error = action.payload;
      })

      // ===== FORGOT PASSWORD =====
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ===== REGISTER =====
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ===== COMPLETE REGISTRATION =====
      .addCase(completeRegistration.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        if (action.payload.user?.profilePic) {
          state.profilePicUrl = action.payload.user.profilePic;
        }
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
        state.token = null;
      })

      // ===== DELETE ACCOUNT =====
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
        state.profilePicUrl = null;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// =============================================
// EXPORT ACTIONS
// =============================================
export const {
  clearAuthError,
  resetAuthStatus,
  updateUserLocally,
  setProfilePicUrl,
} = authSlice.actions;

// =============================================
// SELECTORS
// =============================================
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.status === 'loading';
export const selectProfilePicUrl = (state) => state.auth.profilePicUrl || state.auth.user?.profilePic;
export const selectUsername = (state) => state.auth.user?.username || '';
export const selectUserBio = (state) => state.auth.user?.bio || '';
export const selectUserEmail = (state) => state.auth.user?.email || '';

export const selectUserCommunities = (state) => state.auth.communities;
// =============================================
// DEFAULT EXPORT
// =============================================
export default authSlice.reducer;