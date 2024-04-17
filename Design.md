# TiTle: CICD Dashboard

## Infrusture
- GitHub Page
- GitHub Actions Workflows

## Details
- Write the structure web page based on React
- Store data using json
  - data/components.json
  - details data based on repo name
    - data/repos/libqeep.json
- GitHub Actions workflows will using curl to trigger the workflow in this repo to add the data
  - If the repo does not exists, 
    - It will be added to components.json with parent component name Others
      - Later, user can modify the components.json to move it to the proper parent component
    - Create a new json file named reponame.json to store the raw data
- Request details
  - run_name
  - run_number
  - url
  - time
  - user
  - status
  - isqa
  - test_results
  - s3_urls
  - branch

### Workflows
- Write the json file inside the repos
- Pass the url to artifact and other parameters to the Workflows in CICD_Dashboard
- In CICD_Dashboard:
  - Download the artifact
  - Read the content
  - Write into the json files
  - Commit