import { Route, Routes } from 'react-router-dom'
import FriendsPage from '../pages/FriendsPage'
import GalleryPage from '../pages/GalleryPage'
import HomePage from '../pages/HomePage'
import InspectPage from '../pages/InspectPage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import OAuthCallbackPage from '../pages/OAuthCallbackPage'
import PremiumGalleryPage from '../pages/PremiumGalleryPage'
import TestHubPage from '../pages/TestHubPage'
import ThumbnailStudioPage from '../pages/ThumbnailStudioPage'
import VillagePage from '../pages/VillagePage'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/test" element={<TestHubPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/village" element={<VillagePage />} />
      </Route>
      <Route path="/thumbnails" element={<ThumbnailStudioPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/premium" element={<PremiumGalleryPage />} />
      <Route path="/inspect" element={<InspectPage />} />
    </Routes>
  )
}
