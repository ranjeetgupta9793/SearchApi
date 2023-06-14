$(document).ready(function() {
        getItems();
        finYearInsert();
        
        

    });


function visitedUser(downloadLink,fileName) {
  var userName = _spPageContextInfo.userDisplayName;
  var userEmail=_spPageContextInfo.userEmail;
  var date=new Date();
      
  var URL=_spPageContextInfo.webAbsoluteUrl+"/_api/Web/Lists/GetByTitle('VisitedUsers')/Items";
    
    

    $.ajax({

        url: URL,
        type: "POST",
        data: JSON.stringify({
            __metadata: {
                type: "SP.Data.VisitedUsersListItem"
            }

            ,
            UserName:userName,
            UserEmail: userEmail, //(variable)
            VisitedTime:date,
            FileDownloaded:fileName,
            FileLink:downloadLink,

        }),
    headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "X-HTTP-Method": "POST"
    }

    ,

    //Disabled button 
    success: function(data, status, xhr) {
       //alert("Item added successfully");

    }

    ,
    error: function(xhr, status, error) {
        alert("failed");
    }
});
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function finYearInsert() {


    var currYear=new Date().getFullYear();
    var nextYear=currYear+1;
    nextYear=nextYear.toString().slice(2);
    var filteredYear=currYear+"-"+nextYear;

    try {
        var URL=_spPageContextInfo.webAbsoluteUrl+"/_api/Web/Lists/GetByTitle('SearchByYears')/Items?$select=FinancialYear&$filter=FinancialYear eq '"+filteredYear+"'";

        $.ajax({

            url: URL,
            type: "GET",
            async: false,
            headers: {
                "accept": "application/json;odata=verbose",
            }

            ,
            success: function(data) {
                if (data.d.results.length==0) {
                    //item count check   
                    console.log("No data");
                    //call insert function
                    insertData(filteredYear);
                }

                //end if
            }

            ,
            error: function(xhr) {
                console.log(xhr.status + ': ' + xhr.statusText);
                console.log("Error")
            }
        }); //end ajax
}

//end try
catch (Exception) {
    console.log("Exception :" + Exception.message);
}

}



function getItems() {
    try {
        var URL=_spPageContextInfo.webAbsoluteUrl+"/_api/Web/Lists/GetByTitle('SearchByYears')/Items?$select=FinancialYear";

        $.ajax({

            url: URL,
            type: "GET",
            async: false,
            headers: {
                "accept": "application/json;odata=verbose",
            }

            ,
            success: function(data) {
                if (data.d.results.length > 0) {
                    //item count check   
                    console.log(data.d.results);
                    var results=data.d.results;

                    for (var i=0; i < results.length; i++) {
                        var ID=results[i].ID;
                        var FinancialYear=results[i].FinancialYear;
                        console.log("FinancialYear: " + FinancialYear);

                        $("#ddlFinancialYear").append("<option value='" + FinancialYear + "'>" + FinancialYear + "</option>");

                    }

                    //end for                    
                }

                //end if
            }

            ,
            error: function(xhr) {
                console.log(xhr.status + ': ' + xhr.statusText);
                console.log("Error")
            }
        }); //end ajax
}

//end try
catch (Exception) {
    console.log("Exception :" + Exception.message);
}

}


function getAssessmentYear() {

    var finYear=$('#ddlFinancialYear').val();
    var firstYear=finYear.split('-')[0];
    var lastYear=finYear.split('-')[1];
    var assessmentYear=(parseInt(firstYear) + 1)+'-'+(parseInt(lastYear) + 1);
    $("#ddlAssessmentYear").append("<option value='" + assessmentYear + "'>" + assessmentYear + "</option>");
    $('#ddlAssessmentYear').val(assessmentYear);
}




function insertData(filteredData) {
    var URL=_spPageContextInfo.webAbsoluteUrl+"/_api/Web/Lists/GetByTitle('SearchByYears')/Items";

    $.ajax({

        url: URL,
        type: "POST",
        data: JSON.stringify({
            __metadata: {
                type: "SP.Data.SearchByYearsListItem"
            }

            ,

            FinancialYear: filteredData, //(variable)

        }),
    headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
        "X-HTTP-Method": "POST"
    }

    ,

    //Disabled button 
    success: function(data, status, xhr) {
        $("#ddlFinancialYear").append("<option value='" + filteredData + "'>" + filteredData + "</option>");
        alert("Item added successfully");

    }

    ,
    error: function(xhr, status, error) {
        alert("failed");
    }
});
}




/*function search()
{
	 var data='AAAAA'+'_Q' +$('#ddlQuter').val()+'_'+$('#ddlAssessmentYear').val();
	 $('#getFile').text(data);
	 
}*/


function search() {
    //$("#tableBody2").empty(); //Empty table    
    
    var panVal=$('#PAN').val()+'_Q'+$('#ddlQuter').val()+'_'+$('#ddlAssessmentYear').val();
    var url=_spPageContextInfo.webAbsoluteUrl+"/_api/search/query?querytext=%27title:"+panVal+"*+Site:https://awctrainees.sharepoint.com/sites/TeamPracticeSite/RanjeetGupta/%27";
    var response;

    if ( !$('#PAN').val()) {
        //alert("No data found");
        return;
    }

    $.ajax({

        url: url,
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }

        ,
        success: function(data) {
            response=data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
            $('#errorMessage').html('');

            if (response.length==0) {
                //alert("File Not Found!"); 
                $('#errorMessage').append('<p>Reason for not found the detail.</p>');
                $('#errorMessage').append('<p>1. May be PAN number placed wrong.</p>');
                $('#errorMessage').append('<p>2. May be PAN number not mapped in ERP during above said period.</p>');
                $('#errorMessage').append('<p>3. May be TDS not deducting duirng above period.</p>');
                $('#errorMessage').append('<p>4. May be TDS deducted at higer rate @20% u/s 206AA and TDS Certificate not generated in case of PANNOTAVABL.</p>');
            }

            $.each(response, function(index, result) {

                    var html1="";
                    
                    var iSize = (result.Cells.results.filter(key=> key.Key=="Size")[0].Value / 1024);
                    //alert(iSize);
                    var fileSize="";
                    if (iSize / 1024 > 1) 
								{ 
								if (((iSize / 1024) / 1024) > 1) 
								{ 
								    iSize = (Math.round(((iSize / 1024) / 1024) * 100) / 100);
								    //$("#size").html( iSize + "Gb");
								    fileSize=  iSize + "Gb";
								}
								else
								{ 
								    iSize = (Math.round((iSize / 1024) * 100) / 100)
								   // $("#size").html( iSize + "Mb"); 
								   fileSize=  iSize + "Mb";
								} 
								} 
								else 
								{
								iSize = (Math.round(iSize * 100) / 100)
								 fileSize=  iSize + "Kb";
								}
								
					var downloadURL=result.Cells.results.filter(key=> key.Key=='Path')[0].Value;     
					var fieName= result.Cells.results.filter(key=> key.Key=="Title")[0].Value;               
                    html1 +="<tr>";
                    html1 +="<td>" + result.Cells.results.filter(key=> key.Key=="Title")[0].Value + "</td>";
                    //html1 +="<td>" + result.Cells.results.filter(key=> key.Key=="Size")[0].Value + "</td>";
                    html1 +="<td>" + fileSize + "</td>";
                    html1 +="<td>  <a href='" + result.Cells.results.filter(key=> key.Key=="Path")[0].Value + "' target='_blank' onclick='visitedUser(\""+downloadURL+"\", \""+fieName+"\")'>Download</a></td>";
                    
                    
                    
                    html1 +="</tr>";
                    $("#tableBody2").append(html1);

                    console.log(result);
                    fileSize=0;
                });

            //console.log(response);
        }

        ,
        error: function(error) {
            // error handler code goes here
        }
    });
}
