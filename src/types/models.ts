export interface Tab {
  name: string;
  level: "component";
  description: string;
  repos?: Repo[];
}

export interface Repo {
  name: string;
  level: "repo";
  description: string;
  category: "product" | "qa" | "tool";
  url: string;
  workflows?: Workflow[];
}

export interface Workflow {
  id: number,
  file: string;
  name: string;
  build_workflow_id: number;
  url: string;
  category: "build" | "release" | "qa" | "tool";
}

export interface RunDetails {
  id: number;
  url: string;
  repo: string;
  repo_url: string;
  workflow_name: string;
  workflow_id: number;
  run_number: number;
  time: string;
  user: string;
  branch: string;
  status: string;
  test_result: string;
  build_version: string;
  isRelease: boolean;
  release_version: string;
  s3_urls: string;
}
