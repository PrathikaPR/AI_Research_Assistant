import { Routes } from '@angular/router';
import { UploadComponent } from './pages/upload/upload.component';
import { Dashboard } from './pages/dashboard/dashboard';
import { Summary } from './pages/summary/summary';
import { Questions } from './pages/questions/questions';
import { AskAi } from './pages/ask-ai/ask-ai';
import { Flowchart } from './pages/flowchart/flowchart';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login',     component: Login },
  { path: 'register',  component: Register },
  { path: '',          component: Dashboard,       canActivate: [AuthGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'upload',    component: UploadComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
  { path: 'summary',   component: Summary,         canActivate: [AuthGuard] },
  { path: 'questions', component: Questions,        canActivate: [AuthGuard] },
  { path: 'ask-ai',    component: AskAi,            canActivate: [AuthGuard] },
  { path: 'flowchart', component: Flowchart,        canActivate: [AuthGuard] },
];