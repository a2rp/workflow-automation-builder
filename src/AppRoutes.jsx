import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Loading from "./components/loading";

const WorkflowsPage = lazy(() => import("./pages/workflows"));
const BuilderPage = lazy(() => import("./pages/builder"));
const TemplatesPage = lazy(() => import("./pages/templates"));
const RunsPage = lazy(() => import("./pages/runs"));
const NotFoundPage = lazy(() => import("./pages/notFound"));

const AppRoutes = (props) => {
    const location = useLocation();
    return (
        <Suspense fallback={<Loading />} key={location.pathname}>
            <Routes>
                <Route element={<Navigate replace to="/workflows" />} path="/" />
                <Route element={<WorkflowsPage {...props} />} path="/workflows" />
                <Route element={<BuilderPage {...props} />} path="/builder/:workflowId" />
                <Route element={<TemplatesPage {...props} />} path="/templates" />
                <Route element={<RunsPage {...props} />} path="/runs" />
                <Route element={<NotFoundPage />} path="*" />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;