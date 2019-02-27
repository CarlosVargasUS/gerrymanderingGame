# READ ME

## Data clarification
* THe Areas file maps a feature_id (first column) to the area of a precinct.  
* In the Edge_Lengths file, the first two columns are two feature_id's with non-zero boundary.  A -1 indicates a border element; feature to border elements are only listed once, whereas feature to feature elements are listed twice (as both "fid1 fid2" and "fid2 fid1")
* A collection of districting plans can be found [here](https://git.math.duke.edu/gitlab/gjh/districtingDataRepository.git).  Similar to the area file, the first column is a feature_id and the second is the assignment to a district.
