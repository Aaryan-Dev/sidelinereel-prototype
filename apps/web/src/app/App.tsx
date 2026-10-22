import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/templates';
import { CoachReviewPage } from '../pages/CoachReviewPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ParentPage } from '../pages/ParentPage';
import { ReelsPage } from '../pages/ReelsPage';
import { AppProviders } from './providers';

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/review" replace />} />
            <Route path="review" element={<CoachReviewPage />} />
            <Route path="reels" element={<ReelsPage />} />
            <Route path="parent" element={<ParentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
